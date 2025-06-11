import os

print("Current directory:", os.getcwd())
print("\nFiles in current directory:")
for item in os.listdir('.'):
    if os.path.isfile(item):
        print(f"  FILE: {item}")
    else:
        print(f"  DIR:  {item}/")

print("\nLooking for processor_bindings.cpp:")
if os.path.exists('processor_bindings.cpp'):
    print("  ✓ Found processor_bindings.cpp in root")
else:
    print("  ✗ NOT found processor_bindings.cpp in root")

if os.path.exists('bindings/processor_bindings.cpp'):
    print("  ✓ Found bindings/processor_bindings.cpp")
else:
    print("  ✗ NOT found bindings/processor_bindings.cpp")

print("\nLooking for cpp_modules/processor.cpp:")
if os.path.exists('cpp_modules/processor.cpp'):
    print("  ✓ Found cpp_modules/processor.cpp")
else:
    print("  ✗ NOT found cpp_modules/processor.cpp")

print("\nContents of cpp_modules directory:")
if os.path.exists('cpp_modules'):
    for item in os.listdir('cpp_modules'):
        print(f"  {item}")
else:
    print("  cpp_modules directory doesn't exist")