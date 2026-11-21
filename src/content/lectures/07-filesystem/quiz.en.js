// Self-check questions (English), keyed by page id (see ../index.js)
export default {
  "07-io-streams": [
    {
      "question": "How do InputStream and Reader differ?",
      "options": [
        "InputStream reads bytes, Reader reads characters, taking the encoding into account",
        "Reader works only with the network",
        "An InputStream cannot be buffered",
        "There is no difference"
      ],
      "answer": 0,
      "explanation": "Byte streams work with raw data, character streams with text. Between them stand the InputStreamReader and OutputStreamWriter bridges, which are given an encoding."
    },
    {
      "question": "What does InputStream.read(byte[] buf) return?",
      "options": [
        "Always buf.length",
        "The number of bytes actually read, or -1 at the end of the stream",
        "true or false",
        "The line that was read"
      ],
      "answer": 1,
      "explanation": "The method may read less than the buffer size. That is why you must write write(buf, 0, n), not the whole buffer."
    }
  ],
  "07-filesystem": [
    {
      "question": "Why must Files.lines(path) be used in try-with-resources?",
      "options": [
        "Because it throws a checked exception",
        "Because the stream holds an open file handle until it is closed",
        "Because otherwise the lines are read in reverse order",
        "It does not have to be"
      ],
      "answer": 1,
      "explanation": "A Stream from Files.lines/list/walk is lazy and holds an OS resource. Without close() handles run out, and on Windows the file also stays locked."
    },
    {
      "question": "How do you delete a directory recursively with Files.walk?",
      "options": [
        "Files.delete(dir)",
        "Sort the paths in reverse order and delete from the deepest entries up to the root",
        "Files.walk(dir).forEach(Files::delete) in any order",
        "It is impossible"
      ],
      "answer": 1,
      "explanation": "A directory can be deleted only when it is empty. The reverse order guarantees that a directory's contents are deleted before the directory itself."
    }
  ],
  "07-archives": [
    {
      "question": "What is a Zip Slip attack?",
      "options": [
        "An archive that is too large",
        "An archive entry named like ../../file that ends up outside the target directory during extraction",
        "A corrupted checksum",
        "Slow compression"
      ],
      "answer": 1,
      "explanation": "When extracting, normalize the path and check startsWith(targetDir)."
    }
  ]
}
