package pl.mini.reflect.testing;

// TODO (STAGE 1): add @Retention and @Target — without them reflection does not see the annotation
public @interface Test {
    Class<? extends Throwable> expected() default None.class;

    /** The default value of expected(): "no exception is expected". */
    final class None extends Throwable {
        private None() { }
    }
}
