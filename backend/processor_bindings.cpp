// processor_bindings.cpp (in backend root directory)
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <string>
#include <vector>

namespace py = pybind11;

// Forward declarations from processor.cpp
std::string reverse_text(const std::string& input);
std::string clean_text(const std::string& input);
std::vector<std::string> split_into_chunks(const std::string& text, int chunk_size);
int count_words(const std::string& text);

// Simple add function for testing
int add(int i, int j) {
    return i + j;
}

PYBIND11_MODULE(processor_bindings, m) {
    m.doc() = "PDF Processor bindings module";

    // Test function
    m.def("add", &add, "Add two integers");

    // Text processing functions
    m.def("reverse_text", &reverse_text, "Reverse a string");
    m.def("clean_text", &clean_text, "Clean text by removing extra whitespaces");
    m.def("split_into_chunks", &split_into_chunks, "Split text into chunks",
        py::arg("text"), py::arg("chunk_size") = 100);
    m.def("count_words", &count_words, "Count words in text");
}