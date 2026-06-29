cmake_minimum_required(VERSION 3.10)
project(SimpleBlockchain)

set(CMAKE_CXX_STANDARD 17)

set(SOURCES
    src/block.cpp
    src/blockchain.cpp
)

add_executable(SimpleBlockchain
    ${SOURCES}
    src/main.cpp
)
