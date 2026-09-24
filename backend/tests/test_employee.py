def test_employee_dashboard_requires_login(client):
    response = client.get(
        "/employee/dashboard",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]


def test_employee_profile_requires_login(client):
    response = client.get(
        "/employee/profile",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]