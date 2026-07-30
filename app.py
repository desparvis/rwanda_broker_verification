import os
from flask import Flask, render_template, request, redirect, session, url_for
from dotenv import load_dotenv

# Load the variables from the .env file into the system
load_dotenv()

app = Flask(__name__)

# Fetch the secret key and password securely using os.getenv()
app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback_default_key")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")

@app.route('/')
def user_portal():
    return render_template('user.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # If they are already logged in, send them straight to the admin panel
    if session.get('is_admin'):
        return redirect(url_for('admin_portal'))

    error = None
    if request.method == 'POST':
        password = request.form.get('password')
        if password == ADMIN_PASSWORD:
            session['is_admin'] = True
            return redirect(url_for('admin_portal'))
        else:
            error = "Invalid credential. Access denied."
            
    return render_template('login.html', error=error)

@app.route('/admin')
def admin_portal():
    # THE GATEKEEPER: If they don't have the token, kick them back to login
    if not session.get('is_admin'):
        return redirect(url_for('login'))
        
    return render_template('admin.html')

@app.route('/logout')
def logout():
    # Destroy the session token
    session.pop('is_admin', None)
    return redirect(url_for('user_portal'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)