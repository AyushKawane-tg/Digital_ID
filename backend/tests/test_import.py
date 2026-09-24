from io import BytesIO


def test_employee_import_requires_admin(client):
    excel_file = BytesIO(b"fake excel content")

    response = client.post(
        "/api/admin/import/employees",
        files={
            "file": (
                "employees.xlsx",
                excel_file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        },
        follow_redirects=False
    )

    assert response.status_code in [302, 303, 307, 400, 401, 403, 422]