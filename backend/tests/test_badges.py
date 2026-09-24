def test_badges_page_requires_admin(client):
    response = client.get(
        "/admin/badges",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]


def test_badge_add_requires_admin(client):
    response = client.get(
        "/admin/badges/add",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]