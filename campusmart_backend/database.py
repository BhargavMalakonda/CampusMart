import firebase_admin
from firebase_admin import credentials, firestore
import datetime

# Prevent multiple initializations
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_product_details(product_id):
    print(f"🔍 DEBUG: Fetching product with ID: {product_id}")
    doc = db.collection('products').document(product_id).get()
    if doc.exists:
        return doc.to_dict()
    print(f"❌ ERROR: Product {product_id} not found in 'product-test' collection.")
    return None

def save_message(negotiation_id, sender, text):
    neg_ref = db.collection('negotiations').document(negotiation_id)
    msg_data = {
        "sender": sender,
        "text": text,
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    }
    # Add message to sub-collection
    neg_ref.collection('messages').add(msg_data)
    # set+merge creates the parent doc if it doesn't exist yet
    neg_ref.set({"last_message": text, "updated_at": msg_data["timestamp"]}, merge=True)

def get_chat_history(negotiation_id):
    """Fetch last 10 messages to give the AI context."""
    messages = (
        db.collection('negotiations')
          .document(negotiation_id)
          .collection('messages')
          .order_by("timestamp", direction=firestore.Query.DESCENDING)
          .limit(10)
          .stream()
    )
    history = []
    for m in reversed(list(messages)):
        data = m.to_dict()
        role = "user" if data['sender'] == 'buyer' else "model"
        history.append({"role": role, "parts": [{"text": data['text']}]})
    return history
