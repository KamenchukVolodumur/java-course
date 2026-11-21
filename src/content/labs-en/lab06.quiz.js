export default {
  "Lab06": [
    {
      "question": "Why does LogAnalyzer read the file with a BufferedReader and not with Files.readAllLines?",
      "options": [
        "readAllLines does not support UTF-8",
        "readAllLines loads the whole file into memory, and logs can be larger than the available memory",
        "A BufferedReader compiles faster",
        "There is no difference"
      ],
      "answer": 1,
      "explanation": "Streaming processing keeps only the current line and a buffer in memory, regardless of the file size."
    },
    {
      "question": "Why must the position in LogWatcher be stored in bytes?",
      "options": [
        "Bytes are faster",
        "A UTF-8 character may take several bytes, and FileChannel.position works with bytes; counting in characters gives a wrong offset",
        "Java has no char type",
        "ZIP requires it"
      ],
      "answer": 1,
      "explanation": "Cyrillic letters take 2 bytes, emoji 4. An offset in characters would \"slip\" into the middle of a multi-byte character."
    },
    {
      "question": "Which check protects against Zip Slip?",
      "options": [
        "Checking the file extension",
        "Normalizing the target path and making sure it starts with the extraction directory",
        "Limiting the archive size",
        "Checking the CRC"
      ],
      "answer": 1,
      "explanation": "resolve(\"../x\").normalize() goes outside the directory, and startsWith(targetDir) returns false."
    },
    {
      "question": "Why is the list of listeners a CopyOnWriteArrayList?",
      "options": [
        "It is faster than ArrayList",
        "The dispatch iterates over a snapshot of the list, so a listener can unsubscribe (modify the list) during the dispatch without a ConcurrentModificationException",
        "It sorts the listeners",
        "FileChannel requires it"
      ],
      "answer": 1,
      "explanation": "The list of listeners is read often and changed rarely. For this scenario CopyOnWrite is ideal."
    }
  ]
}
