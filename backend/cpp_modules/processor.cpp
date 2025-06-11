#include <string>
#include <vector>
#include <algorithm>
#include <sstream>
#include <cctype>

// Simple text processing functions

std::string reverse_text(const std::string& input) {
    return std::string(input.rbegin(), input.rend());
}

std::string clean_text(const std::string& input) {
    std::string result = input;
    
    // Remove carriage returns
    result.erase(std::remove(result.begin(), result.end(), '\r'), result.end());
    
    // Replace multiple consecutive spaces with single space
    bool prev_space = false;
    std::string cleaned;
    
    for (char c : result) {
        if (std::isspace(c)) {
            if (!prev_space) {
                cleaned += ' ';
                prev_space = true;
            }
        } else {
            cleaned += c;
            prev_space = false;
        }
    }
    
    // Trim leading and trailing spaces
    size_t start = cleaned.find_first_not_of(' ');
    if (start == std::string::npos) return "";
    
    size_t end = cleaned.find_last_not_of(' ');
    return cleaned.substr(start, end - start + 1);
}

std::vector<std::string> split_into_chunks(const std::string& text, int chunk_size) {
    std::vector<std::string> chunks;
    std::istringstream iss(text);
    std::string word;
    std::string current_chunk;
    int word_count = 0;
    
    while (iss >> word) {
        if (word_count > 0 && word_count % chunk_size == 0) {
            chunks.push_back(current_chunk);
            current_chunk = word;
            word_count = 1;
        } else {
            if (!current_chunk.empty()) {
                current_chunk += " ";
            }
            current_chunk += word;
            word_count++;
        }
    }
    
    if (!current_chunk.empty()) {
        chunks.push_back(current_chunk);
    }
    
    return chunks;
}

int count_words(const std::string& text) {
    std::istringstream iss(text);
    std::string word;
    int count = 0;
    
    while (iss >> word) {
        count++;
    }
    
    return count;
}