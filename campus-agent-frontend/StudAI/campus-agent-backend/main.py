from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_negotiation_turn
from database import get_product_details, save_message, get_chat_history

app = FastAPI()

# Allow requests from localhost and file:// (origin: null)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    product_id: str
    negotiation_id: str
    message: str

@app.post("/negotiate")
async def handle_chat(req: ChatRequest):
    # 1. Fetch Product
    product = get_product_details(req.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Get past context (memory)
    history = get_chat_history(req.negotiation_id)

    # 3. Get AI Response
    ai_response = run_negotiation_turn(req.message, product, history)

    # 4. Save to Database
    save_message(req.negotiation_id, "buyer", req.message)
    save_message(req.negotiation_id, "agent", ai_response)

    return {"reply": ai_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
