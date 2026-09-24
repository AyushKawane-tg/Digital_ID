def test_locations_page_requires_admin(client):
    response = client.get(
        "/admin/locations",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]


def test_location_add_requires_admin(client):
    response = client.get(
        "/admin/locations/add",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]