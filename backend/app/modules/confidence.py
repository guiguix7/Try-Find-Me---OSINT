def classify_confidence(score: float) -> str:
    # TODO: validar o intervalo permitido

    # TODO: classificar o nível de confiança
    confidence_levels = {
        3.0: "high",
        2.0: "medium",
        1.0: "low",
    }

    try:
        return confidence_levels[score]
    except KeyError as error:
        raise ValueError("score must be 1.0, 2.0, or 3.0") from error
