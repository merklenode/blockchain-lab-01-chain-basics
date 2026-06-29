#include "block.h"
#include "sha256.h"

Block::Block(int index, const std::string& data, const std::string& prevHash)
    : index(index), data(data), prevHash(prevHash), timestamp(std::time(nullptr)) {
    generateHash();
}

std::string Block::calculateHash() const {
    std::string toHash = std::to_string(index) + std::to_string(timestamp) + data + prevHash;
    return MySHA256::hash(toHash);
}

void Block::generateHash() {
    hash = calculateHash();
}

std::string Block::getHash() const {
    return hash;
}

std::string Block::getPrevHash() const {
    return prevHash;
}

std::string Block::getData() const {
    return data;
}

int Block::getIndex() const {
    return index;
}

std::time_t Block::getTimestamp() const {
    return timestamp;
}
