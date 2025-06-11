import sys
import sysconfig
import os
from setuptools import setup, Extension
import pybind11

# Get Python library information
python_lib_dir = sysconfig.get_config_var('LIBDIR')
if sys.platform == 'win32':
    # Python static lib usually named python3x.lib (python313.lib)
    python_libname = f'python{sys.version_info.major}{sys.version_info.minor}'
else:
    python_libname = sysconfig.get_config_var('LIBRARY')
    if python_libname:
        python_libname = os.path.splitext(python_libname)[0]

# Define the extension module
ext_modules = [
    Extension(
        'processor_bindings',
        [
            'processor_bindings.cpp',  # File is in the backend root directory
            'cpp_modules/processor.cpp'  # Include the actual implementation
        ],
        include_dirs=[
            pybind11.get_include(),
            'cpp_modules'  # Include directory for processor.h if needed
        ],
        library_dirs=[python_lib_dir] if python_lib_dir else [],
        libraries=[python_libname] if python_libname else [],
        language='c++',
        cxx_std=17,  # Use C++17 standard
    ),
]

setup(
    name='processor_bindings',
    ext_modules=ext_modules,
    zip_safe=False,
)