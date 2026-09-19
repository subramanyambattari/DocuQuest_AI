from celery import Celery
import os

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("document_worker", broker=redis_url, backend=redis_url)

celery_app.conf.task_routes = {
    "app.workers.*": "main-queue",
}

@celery_app.task
def test_worker():
    return "Worker is ready!"
