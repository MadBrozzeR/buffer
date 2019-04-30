# mbr-buffer
Reading and writing Buffer operations

Currently only Reader has been implemented. Planning on Writer implementation as soon as I can or have a demand to.
Already have certain ideas on its case.

My projects always have restrictions to not to use third party packages.
Only the ones included in default NodeJS and my own other projects.
This approach helps to make them really lightweight and fast.

## Reader
Utility to read from buffer. You are always free to extend it by methods reqired by your project.
```
const reader = new Reader(buffer);
```

