cmake_minimum_required(VERSION 3.10)
project(SimpleBlockchain)

set(CMAKE_CXX_STANDARD 17)

set(SOURCES
    src/core/block.cpp
    src/core/blockchain.cpp
)

add_executable(SimpleBlockchain
    ${SOURCES}
    src/app/main.cpp
)

target_include_directories(SimpleBlockchain PRIVATE
    src/core
    src/crypto
)
