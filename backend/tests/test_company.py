def test_company_page_requires_admin(client):
    response = client.get(
        "/admin/company",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]


def test_company_edit_requires_admin(client):
    response = client.get(
        "/admin/company/edit",
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 401, 403]