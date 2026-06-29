#ifndef BLOCKCHAIN_H
#define BLOCKCHAIN_H

#include "block.h"
#include <vector>

class Blockchain {
public:
    Blockchain();

    void addBlock(const std::string& data);
    void printChain() const;
    bool isValid() const;
    const std::vector<Block>& getChain() const;

private:
    std::vector<Block> chain;

    Block createGenesisBlock() const;
};

#endif // BLOCKCHAIN_H
