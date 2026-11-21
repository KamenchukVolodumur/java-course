package pl.mini.bank.domain;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@Tag("stage1")
class PeselTest {

    @ParameterizedTest
    @ValueSource(strings = {"44051401359", "02070803628"})
    void validNumbers(String pesel) {
        assertThat(Pesel.isValid(pesel)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"44051401358", "4405140135", "440514013590", "4405140135a", ""})
    void invalidNumbers(String pesel) {
        assertThat(Pesel.isValid(pesel)).isFalse();
    }

    @Test
    void nullIsInvalid() {
        assertThat(Pesel.isValid(null)).isFalse();
    }

    @Test
    void maskKeepsTheLastFourDigits() {
        assertThat(Pesel.mask("44051401359")).isEqualTo("*******1359");
    }

    @Test
    void clientChecksItsInvariants() {
        assertThatThrownBy(() -> new Client(null, "12345678901", "Jan", BigDecimal.ZERO)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Client(null, "44051401359", " ", BigDecimal.ZERO)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Client(null, "44051401359", "Jan", new BigDecimal("-0.01"))).isInstanceOf(IllegalArgumentException.class);
        assertThatCode(() -> new Client(null, "44051401359", "Jan", BigDecimal.ZERO)).doesNotThrowAnyException();
    }
}
