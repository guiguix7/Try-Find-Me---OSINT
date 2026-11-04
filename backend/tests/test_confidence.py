import pytest

from app.modules.confidence import classify_confidence


def test_high_confidence():
    assert classify_confidence(3.0) == "high"


def test_medium_confidence():
    assert classify_confidence(2.0) == "medium"


def test_low_confidence():
    assert classify_confidence(1.0) == "low"


def test_invalid_confidence():
    with pytest.raises(ValueError):
        classify_confidence(1.5)  # Invalid confidence score