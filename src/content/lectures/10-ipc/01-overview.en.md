---
title: Overview
description: What inter-process communication is and which mechanisms for it are available in Java — processes and pipes, the network, files, shared memory, serialization.
---

**Inter-Process Communication** (IPC) is a set of mechanisms that let processes exchange data and synchronize their actions. Processes, unlike threads, **do not share memory**: each runs in its own address space, so exchanging data requires help from the OS.

Mechanisms available in Java:

* **Processes and pipes** — streaming data between processes on the same machine. The standard I/O streams of a child process (`ProcessBuilder`) are **anonymous pipes** between parent and child. For independent processes there are **Unix domain sockets** (Java 16), which play the role of named pipes.
* **The network** — the TCP and UDP protocols (`Socket`, `ServerSocket`, `DatagramSocket`) and application-layer protocols such as HTTP (`HttpClient`). They work the same whether the processes are on one machine, in a local network or in different corners of the world.
* **Files** — processes write and read data from shared files on disk. A simple method, but it requires agreements on the format and synchronization (e.g. locking with `FileChannel.lock()`).
* **Shared memory** — several processes map the same file into their memory (`FileChannel.map`, `MemorySegment`). The fastest form of IPC, but synchronizing access has to be organized by yourself.

Pipes and the network transmit **bytes**. To transmit objects, they must be **serialized** — converted into a sequence of bytes in an agreed format (JSON, binary formats). The last page of the chapter is devoted to this.
