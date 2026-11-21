package pl.mini.bank.domain;

// STAGE 1
public final class Pesel {
    private Pesel() { }

    public static boolean isValid(String pesel) {
        throw new UnsupportedOperationException("TODO");
    }

    /** "44051401359" -> "*******1359" */
    public static String mask(String pesel) {
        throw new UnsupportedOperationException("TODO");
    }
}
