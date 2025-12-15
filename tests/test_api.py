import uuid
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def unique_email():
    return f"test+{uuid.uuid4().hex}@example.com"


def test_get_activities():
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert "Basketball Team" in data


def test_signup_and_unregister():
    activity = "Art Club"
    email = unique_email()

    # sign up (use params to ensure proper encoding of special chars)
    res = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert res.status_code == 200
    assert "Signed up" in res.json().get("message", "")

    # verify participant present
    data = client.get("/activities").json()
    assert email in data[activity]["participants"]

    # unregister (use params to ensure proper encoding)
    res2 = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert res2.status_code == 200
    assert "Unregistered" in res2.json().get("message", "")

    # verify removed
    data2 = client.get("/activities").json()
    assert email not in data2[activity]["participants"]


def test_unregister_nonexistent():
    activity = "Debate Team"
    email = unique_email()

    res = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert res.status_code == 404
    assert res.json().get("detail") == "Participant not found in activity"
