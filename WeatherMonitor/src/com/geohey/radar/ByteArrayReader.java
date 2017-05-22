package com.geohey.radar;

import java.nio.ByteBuffer;

public class ByteArrayReader {
	public ByteArrayReader(){
		
	}
	
	public ByteArrayReader(byte[] buffer){
		this.set_buffer(buffer);
	}
	
	private byte[] _buffer = null;
	private int offset = 0;
	private int length = 0;
	public Boolean isDebug = false;
	public Boolean isBigEndian = true;
	
	public void skip(int step){
		offset = offset + step;
	}
	
	public int getUnsignedShort() throws Exception{
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		//Short.to
		int returnValue = _buffer[offset]&0x0FF;;
		offset++;
		return returnValue;
	}
	
	public byte getByte() throws Exception{
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		byte returnValue = _buffer[offset];
		offset++;
		return returnValue;
	}
	
	public short getInt16() throws Exception {
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		byte[] wrapBytes = new byte[2];
		if(isBigEndian){
			wrapBytes[0] = _buffer[offset+1];
			wrapBytes[1] = _buffer[offset];
		}
		else{
			wrapBytes[0] = _buffer[offset];
			wrapBytes[1] = _buffer[offset+1];
		}
		short result = (short) ((int)wrapBytes[0]&0xff);
        result |= ((int)wrapBytes[1]&0xff) << 8;
        offset = offset+2;
        if(isDebug)
        	System.out.println(result & 0xffff);
        return (short) (result & 0xffff);
    }
	
	public int getUInt16() throws Exception {
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		byte[] wrapBytes = new byte[2];
		if(isBigEndian){
			wrapBytes[0] = _buffer[offset+1];
			wrapBytes[1] = _buffer[offset];
		}
		else{
			wrapBytes[0] = _buffer[offset];
			wrapBytes[1] = _buffer[offset+1];
		}
		int result = (int)wrapBytes[1]&0xff;
        result |= ((int)wrapBytes[0]&0xff) << 8;
        offset = offset + 2;
        if(isDebug)
        	System.out.println(result & 0xffff);
        return result & 0xffff;
    }
	
	public int getInt32() throws Exception {
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		byte[] wrapBytes = new byte[4];
		if(isBigEndian){
			wrapBytes[0] = _buffer[offset+3];
			wrapBytes[1] = _buffer[offset+2];
			wrapBytes[2] = _buffer[offset+1];
			wrapBytes[3] = _buffer[offset];
		}
		else{
			wrapBytes[3] = _buffer[offset+3];
			wrapBytes[2] = _buffer[offset+2];
			wrapBytes[1] = _buffer[offset+1];
			wrapBytes[0] = _buffer[offset];
		}
		
		int result = (int)wrapBytes[0]&0xff;
        result |= ((int)wrapBytes[1]&0xff) << 8;
        result |= ((int)wrapBytes[2]&0xff) << 16;
        result |= ((int)wrapBytes[3]&0xff) << 24;
        offset = offset + 4;
        if(isDebug)
        	System.out.println(result);
        return result;
    }
	
	public long getUInt32(byte[] bytes, int offset) throws Exception {
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
		byte[] wrapBytes = new byte[4];
		if(isBigEndian){
			wrapBytes[0] = _buffer[offset+3];
			wrapBytes[1] = _buffer[offset+2];
			wrapBytes[2] = _buffer[offset+1];
			wrapBytes[3] = _buffer[offset];
		}
		else{
			wrapBytes[3] = _buffer[offset+3];
			wrapBytes[2] = _buffer[offset+2];
			wrapBytes[1] = _buffer[offset+1];
			wrapBytes[0] = _buffer[offset];
		}
        long result = (int)wrapBytes[0]&0xff;
        result |= ((int)wrapBytes[1]&0xff) << 8;
        result |= ((int)wrapBytes[2]&0xff) << 16;
        result |= ((int)wrapBytes[3]&0xff) << 24;
        offset = offset+4;
        if(isDebug)
        	System.out.println(result & 0xFFFFFFFFL);
        return result & 0xFFFFFFFFL;
    }
	
	public long getUInt64(byte[] bytes, int offset) throws Exception {
		if(_buffer == null || offset >= length){
			throw new Exception("字节流为null，或者已经超过读取长度");
		}
        long result = 0;
        for (int i = 0; i <= 56; i += 8) {
			result |= ((int)bytes[offset++]&0xff) << i;
		}
        offset = offset+8;
        if(isDebug)
        	System.out.println(result);
        return result;
    }

//	public byte[] GetBytes(int value) {
//		byte[] bytes = new byte[4];
//		bytes[0] = (byte) (value >> 24);
//		bytes[1] = (byte) (value >> 16);
//		bytes[2] = (byte) (value >> 8);
//		bytes[3] = (byte) (value);
//		//System.out.println(Arrays.toString(bytes));
//		return bytes;
//	}
//	
//	public byte[] GetBytes(long value) {
//		byte[] bytes = new byte[4];
//		bytes[0] = (byte) (value >> 24);
//		bytes[1] = (byte) (value >> 16);
//		bytes[2] = (byte) (value >> 8);
//		bytes[3] = (byte) (value);
//		//System.out.println(Arrays.toString(bytes));
//		return bytes;
//	}
	
	public float getSingle() {
		byte[] wrapBytes = new byte[4];
		for(int i=0;i<4;i++){
			wrapBytes[i] = _buffer[offset + i];
		}
		ByteBuffer buf = ByteBuffer.wrap(wrapBytes, 0, 4);
		float outp = buf.getFloat();
		offset = offset + 4;
		if(isDebug)
        	System.out.println(outp);
		return outp;
	}

	public void set_buffer(byte[] _buffer) {
		this._buffer = _buffer;
		this.length = _buffer.length;
		this.setOffset(0);
	}

	public byte[] get_buffer() {
		return _buffer;
	}

	public void setOffset(int offset) {
		this.offset = offset;
	}

	public int getOffset() {
		return offset;
	}
}
