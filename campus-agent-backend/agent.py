import os
import re
import ollama
import traceback
from dotenv import load_dotenv
from prompts import SYSTEM_INSTRUCTION

# Load env in case you have other vars, though Ollama doesn't need a key
load_dotenv()

def run_negotiation_turn(user_message, product_data, history):
    """
    Runs a negotiation turn using local Ollama (Phi-3).
    Includes a math-based fallback for demo safety.
    """
    
    # 1. Safely extract product fields
    name      = product_data.get('name', 'Item')
    price     = float(product_data.get('price', 0))
    mrp       = float(product_data.get('mrp', price))
    condition = product_data.get('condition', 'Used')
    desc      = product_data.get('desc', 'No description provided.')
    category  = product_data.get('category', '')

    # 2. Logic for Floor Price
    floor_pct = 0.82 if category == 'Electronics' else 0.80
    min_price = round(price * floor_pct)

    print(f"DEBUG: Local Ollama (Phi-3) Negotiating for {name}")
    print(f"DEBUG: Price: {price}, Min Price: {min_price}")

    # 3. Format the prompt for Phi-3
    try:
        formatted_instruction = SYSTEM_INSTRUCTION.format(
            name=name,
            price=int(price),
            mrp=int(mrp),
            condition=condition,
            desc=desc,
            min_price=min_price,
        )
    except Exception as fmt_err:
        print(f"DEBUG: Prompt Format Error: {fmt_err}")
        return "Hey, my system is glitching. Let's stick to the basics. What's your offer?"

    # 4. Convert Gemini history format to Ollama format if necessary
    # (Ollama wants {'role': 'user', 'content': '...'})
    ollama_history = []
    for entry in history:
        role = entry.get('role')
        # Handle both Gemini 'parts' format and simple string format
        if 'parts' in entry:
            content = entry['parts'][0].get('text', '')
        else:
            content = entry.get('content', '')
        ollama_history.append({'role': role, 'content': content})

    # 5. Call local Ollama
    try:
        response = ollama.chat(model='phi3', messages=[
            {'role': 'system', 'content': formatted_instruction},
            *ollama_history,
            {'role': 'user', 'content': user_message},
        ])
        
        ai_reply = response['message']['content']

        # --- PRICE GUARD ---
        # Prevent the AI from "scamming itself" by closing a deal below the
        # buyer's own offer. If [[DEAL:X]] price < user's offered amount AND
        # user's offer is at or above the floor, override with the higher price.
        deal_match = re.search(r'\[\[DEAL:(\d+)\]\]', ai_reply)
        user_digits = re.findall(r'\d+', user_message)
        user_offer = int(user_digits[0]) if user_digits else 0

        if deal_match and user_offer > 0:
            ai_deal_price = int(deal_match.group(1))
            if ai_deal_price < user_offer and user_offer >= min_price:
                print(f"⚠️ PRICE GUARD: AI tried to deal at ₹{ai_deal_price} "
                      f"but buyer offered ₹{user_offer}. Overriding to ₹{user_offer}.")
                ai_reply = re.sub(
                    r'\[\[DEAL:\d+\]\]',
                    f'[[DEAL:{user_offer}]]',
                    ai_reply
                )

        return ai_reply

    except Exception as e:
        print(f"⚠️ OLLAMA FAILED: {e}")
        print(traceback.format_exc())

        # --- THE DEMO-PROOF FAIL-SAFE (Math Bot) ---
        # Extracts numbers from the user's message to respond logically
        digits = re.findall(r'\d+', user_message)
        user_offer = int(digits[0]) if digits else 0

        if user_offer >= min_price:
            return f"I've got other people asking, but ₹{user_offer} is fair. Deal! [[DEAL:{user_offer}]]"
        
        if user_offer > 0:
            return f"No way, ₹{user_offer} is way too low. The absolute lowest I can do for this {name} is ₹{min_price}. Take it or leave it! 😤"
            
        return f"Yo, I'm a bit busy, but I'm looking for around ₹{price} for this {name}. What's your best offer?"