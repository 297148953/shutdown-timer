const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type);
    const crc = Buffer.alloc(4);
    const crcData = Buffer.concat([typeBuffer, data]);
    let crcValue = 0xffffffff;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c;
    }
    for (let i = 0; i < crcData.length; i++) {
      crcValue = crcTable[(crcValue ^ crcData[i]) & 0xff] ^ (crcValue >>> 8);
    }
    crcValue = crcValue ^ 0xffffffff;
    crc.writeUInt32BE(crcValue >>> 0, 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngPath = 'd:/aichuangzuo/shutdown-timer/src-tauri/icons/icon.png';
const icoPath = 'd:/aichuangzuo/shutdown-timer/src-tauri/icons/icon.ico';

const png = createPng(256, 256, 100, 149, 237);
fs.writeFileSync(pngPath, png);
console.log('PNG icon created:', pngPath);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const iconEntry = Buffer.alloc(16);
iconEntry.writeUInt8(0, 0);
iconEntry.writeUInt8(0, 1);
iconEntry.writeUInt8(0, 2);
iconEntry.writeUInt8(0, 3);
iconEntry.writeUInt16LE(1, 4);
iconEntry.writeUInt16LE(32, 6);
iconEntry.writeUInt32LE(png.length, 8);
iconEntry.writeUInt32LE(22, 12);

const ico = Buffer.concat([icoHeader, iconEntry, png]);
fs.writeFileSync(icoPath, ico);
console.log('ICO icon created:', icoPath);
console.log('Done!');
