#ifndef SHA256_H
#define SHA256_H

/*
    Copyright (c) 2013-2019, Igor Golubev
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
    2. Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
    ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

#include <string>
#include <vector>
#include <cstdint>
#include <cstring>
#include <sstream>
#include <iomanip>

namespace MySHA256 {

    class SHA256 {
    public:
        SHA256() {
            reset();
        }

        void update(const uint8_t* data, size_t length) {
            for (size_t i = 0; i < length; ++i) {
                m_buffer[m_bufferLength++] = data[i];
                if (m_bufferLength == 64) {
                    processBlock(m_buffer);
                    m_bitCount += 512;
                    m_bufferLength = 0;
                }
            }
        }

        void update(const std::string& data) {
            update(reinterpret_cast<const uint8_t*>(data.c_str()), data.length());
        }

        std::string final() {
            uint64_t bitCount = m_bitCount + m_bufferLength * 8;
            m_buffer[m_bufferLength++] = 0x80;

            if (m_bufferLength > 56) {
                while (m_bufferLength < 64) m_buffer[m_bufferLength++] = 0x00;
                processBlock(m_buffer);
                m_bufferLength = 0;
            }

            while (m_bufferLength < 56) m_buffer[m_bufferLength++] = 0x00;

            for (int i = 0; i < 8; ++i) {
                m_buffer[56 + i] = static_cast<uint8_t>(bitCount >> (56 - i * 8));
            }

            processBlock(m_buffer);

            std::stringstream ss;
            for (int i = 0; i < 8; ++i) {
                ss << std::hex << std::setw(8) << std::setfill('0') << m_state[i];
            }

            reset();
            return ss.str();
        }

    private:
        uint32_t m_state[8];
        uint32_t m_bitCount;
        uint8_t m_buffer[64];
        uint32_t m_bufferLength;

        void reset() {
            m_state[0] = 0x6a09e667; m_state[1] = 0xbb67ae85; m_state[2] = 0x3c6ef372; m_state[3] = 0xa54ff53a;
            m_state[4] = 0x510e527f; m_state[5] = 0x9b05688c; m_state[6] = 0x1f83d9ab; m_state[7] = 0x5be0cd19;
            m_bitCount = 0;
            m_bufferLength = 0;
        }

        static uint32_t rotr(uint32_t x, uint32_t n) { return (x >> n) | (x << (32 - n)); }
        static uint32_t choose(uint32_t x, uint32_t y, uint32_t z) { return (x & y) ^ (~x & z); }
        static uint32_t majority(uint32_t x, uint32_t y, uint32_t z) { return (x & y) ^ (x & z) ^ (y & z); }
        static uint32_t sig0(uint32_t x) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >> 3); }
        static uint32_t sig1(uint32_t x) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >> 10); }

        void processBlock(const uint8_t* block) {
            static const uint32_t k[64] = {
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            };

            uint32_t w[64];
            for (int i = 0; i < 16; ++i) {
                w[i] = (block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | (block[i * 4 + 3]);
            }
            for (int i = 16; i < 64; ++i) {
                w[i] = sig1(w[i - 2]) + w[i - 7] + sig0(w[i - 15]) + w[i - 16];
            }

            uint32_t a = m_state[0], b = m_state[1], c = m_state[2], d = m_state[3];
            uint32_t e = m_state[4], f = m_state[5], g = m_state[6], h = m_state[7];

            for (int i = 0; i < 64; ++i) {
                uint32_t t1 = h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + choose(e, f, g) + k[i] + w[i];
                uint32_t t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + majority(a, b, c);
                h = g; g = f; f = e; e = d + t1;
                d = c; c = b; b = a; a = t1 + t2;
            }

            m_state[0] += a; m_state[1] += b; m_state[2] += c; m_state[3] += d;
            m_state[4] += e; m_state[5] += f; m_state[6] += g; m_state[7] += h;
        }
    };

    inline std::string hash(const std::string& input) {
        SHA256 sha;
        sha.update(input);
        return sha.final();
    }

} // namespace MySHA256

#endif // SHA256_H