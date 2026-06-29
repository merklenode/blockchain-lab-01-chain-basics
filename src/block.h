#ifndef BLOCK_H
#define BLOCK_H

#include <string>
#include <vector>
#include <ctime>

class Block {
public:
    Block(int index, const std::string& data, const std::string& prevHash);

    std::string calculateHash() const;
    std::string getHash() const;
    std::string getPrevHash() const;
    std::string getData() const;
    int getIndex() const;
    std::time_t getTimestamp() const;

private:
    int index;
    std::string data;
    std::string hash;
    std::string prevHash;
    std::time_t timestamp;

    void generateHash();
};

#endif // BLOCK_H
