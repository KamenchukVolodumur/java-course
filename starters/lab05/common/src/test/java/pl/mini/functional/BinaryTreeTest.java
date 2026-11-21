package pl.mini.functional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Tag("A1")
class BinaryTreeTest {

    private final BinaryTree<Integer> tree = BinaryTree.of(5, 3, 8, 1, 4, 9);

    @Test
    void preInAndPostOrderVisitNodesInTheRightOrder() {
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        tree.depthFirst((v, d) -> pre.add(v), (v, d) -> in.add(v), (v, d) -> post.add(v));

        assertEquals(List.of(5, 3, 1, 4, 8, 9), pre);
        assertEquals(List.of(1, 3, 4, 5, 8, 9), in);
        assertEquals(List.of(1, 4, 3, 9, 8, 5), post);
    }

    @Test
    void rootHasDepthZeroAndChildrenAreOneDeeper() {
        List<String> visits = new ArrayList<>();
        tree.depthFirst((v, d) -> visits.add(v + "@" + d), null, null);

        assertEquals(List.of("5@0", "3@1", "1@2", "4@2", "8@1", "9@2"), visits);
    }

    @Test
    void nullCallbacksAreSkipped() {
        List<Integer> in = new ArrayList<>();
        assertDoesNotThrow(() -> tree.depthFirst(null, (v, d) -> in.add(v), null));
        assertEquals(6, in.size());
    }

    @Test
    void equalValuesGoToTheRight() {
        BinaryTree<Integer> t = BinaryTree.of(2, 2, 1);
        List<Integer> pre = new ArrayList<>();
        t.depthFirst((v, d) -> pre.add(v), null, null);

        assertEquals(List.of(2, 1, 2), pre);
    }

    @Test
    void emptyTreeVisitsNothing() {
        List<Integer> seen = new ArrayList<>();
        BinaryTree.<Integer>of().depthFirst((v, d) -> seen.add(v), (v, d) -> seen.add(v), (v, d) -> seen.add(v));

        assertTrue(seen.isEmpty());
    }

    @Test
    void printInOrderIndentsByDepth() {
        String printed = captureStdout(tree::printInOrder);

        assertEquals("    1\n  3\n    4\n5\n  8\n    9\n", printed);
    }

    static String captureStdout(Runnable action) {
        PrintStream original = System.out;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        System.setOut(new PrintStream(buffer, true, StandardCharsets.UTF_8));
        try {
            action.run();
        } finally {
            System.setOut(original);
        }
        return buffer.toString(StandardCharsets.UTF_8).replace("\r\n", "\n");
    }
}
