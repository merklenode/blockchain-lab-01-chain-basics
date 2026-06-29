#include "blockchain.h"
#include <iostream>

Blockchain::Blockchain() {
    chain.push_back(createGenesisBlock());
}

Block Blockchain::createGenesisBlock() const {
    return Block(0, "Genesis Block", "0");
}

void Blockchain::addBlock(const std::string& data) {
    const Block& prevBlock = chain.back();
    chain.push_back(Block(chain.size(), data, prevBlock.getHash()));
}

void Blockchain::printChain() const {
    for (const Block& block : chain) {
        std::cout << "Block " << block.getIndex() << " [" << block.getHash() << "]:\n";
        std::cout << "  Previous Hash: " << block.getPrevHash() << "\n";
        std::cout << "  Data: " << block.getData() << "\n";
    }
}

bool Blockchain::isValid() const {
    for (size_t i = 1; i < chain.size(); ++i) {
        const Block& currentBlock = chain[i];
        const Block& prevBlock = chain[i - 1];

        if (currentBlock.getHash() != currentBlock.calculateHash()) {
            return false;
        }

        if (currentBlock.getPrevHash() != prevBlock.getHash()) {
            return false;
        }
    }
    return true;
}

const std::vector<Block>& Blockchain::getChain() const {
    return chain;
}
