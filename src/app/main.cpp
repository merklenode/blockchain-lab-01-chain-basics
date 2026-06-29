#include "blockchain.h"
#include <iostream>

int main() {
    Blockchain blockchain;

    blockchain.addBlock("First block data");
    blockchain.addBlock("Second block data");

    blockchain.printChain();
    return 0;
}
