def test_unknown_digital_card(client):
    response = client.get(
        "/card/UNKNOWN",
        follow_redirects=False
    )

    assert response.status_code == 404


def test_digital_card_url_structure(client):
    response = client.get(
        "/card/TG001",
        follow_redirects=False
    )

    assert response.status_code in [200, 404]