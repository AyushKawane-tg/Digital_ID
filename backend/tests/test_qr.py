def test_qr_for_unknown_employee(client):
    response = client.get(
        "/card/UNKNOWN/qr",
        follow_redirects=False
    )

    assert response.status_code in [404, 302, 303, 307]


def test_qr_download_for_unknown_employee(client):
    response = client.get(
        "/card/UNKNOWN/qr/download",
        follow_redirects=False
    )

    assert response.status_code in [404, 302, 303, 307]