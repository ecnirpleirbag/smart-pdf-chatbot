cmake_minimum_required(VERSION 3.14)
project(PDFChatBot LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Find Python
find_package(Python COMPONENTS Interpreter Development REQUIRED)

# Add pybind11
add_subdirectory(pybind11)

# Create the processor library
add_library(processor STATIC
    cpp_modules/processor.cpp
)

target_include_directories(processor PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/cpp_modules
)

# Create the Python module
add_library(processor_bindings MODULE
    bindings/processor_bindings.cpp
)

target_link_libraries(processor_bindings PRIVATE
    pybind11::module
    Python::Python
    processor
)

# Set proper extension
if(WIN32)
    set_target_properties(processor_bindings PROPERTIES
        PREFIX ""
        SUFFIX ".pyd"
    )
else()
    set_target_properties(processor_bindings PROPERTIES
        PREFIX ""
        SUFFIX ".so"
    )
endif()

# Compiler-specific options
if(MSVC)
    target_compile_options(processor PRIVATE /W4)
    target_compile_options(processor_bindings PRIVATE /W4)
else()
    target_compile_options(processor PRIVATE -Wall -Wextra -pedantic)
    target_compile_options(processor_bindings PRIVATE -Wall -Wextra -pedantic)
endif()