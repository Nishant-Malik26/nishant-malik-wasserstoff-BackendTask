import requests
from concurrent.futures import ThreadPoolExecutor


def send_request(ins, j):
    try:
        response = requests.get(ins)
        print(f"Request {j + 1} status:", response.status_code)
    except Exception as e:
        print(f"Request {j + 1} error:", e)


url = 'http://localhost:3000/fast'
url2 = 'http://localhost:3000/slow'
number_of_requests = 1000  # Number of requests you want to send

with ThreadPoolExecutor(max_workers=50) as executor:
    for i in range(number_of_requests):
        if i % 2 == 0:
            executor.submit(send_request, url, i)
        else:
            executor.submit(send_request, url2, i)

