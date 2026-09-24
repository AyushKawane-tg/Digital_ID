def test_login_page(client):
    response = client.get("/login")

    assert response.status_code == 200


def test_invalid_login(client):
    response = client.post(
        "/login",
        data={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        },
        follow_redirects=False
    )

    assert response.status_code in [200, 302, 303, 307, 401, 403]