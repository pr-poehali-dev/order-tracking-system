import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для управления заказами - создание, получение, обновление статусов'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    conn = psycopg2.connect(db_url, options=f'-c search_path={schema}')
    cur = conn.cursor()
    
    try:
        
        if method == 'GET':
            tracking_number = event.get('queryStringParameters', {}).get('tracking_number')
            
            if tracking_number:
                cur.execute(
                    "SELECT id, tracking_number, customer_name, product, status, created_at, updated_at FROM orders WHERE tracking_number = %s",
                    (tracking_number,)
                )
                row = cur.fetchone()
                
                if row:
                    order = {
                        'id': row[0],
                        'trackingNumber': row[1],
                        'customerName': row[2],
                        'product': row[3],
                        'status': row[4],
                        'createdAt': row[5].isoformat() if row[5] else None,
                        'updatedAt': row[6].isoformat() if row[6] else None
                    }
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(order)
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Заказ не найден'})
                    }
            else:
                cur.execute(
                    "SELECT id, tracking_number, customer_name, product, status, created_at, updated_at FROM orders ORDER BY created_at DESC"
                )
                rows = cur.fetchall()
                
                orders = []
                for row in rows:
                    orders.append({
                        'id': row[0],
                        'trackingNumber': row[1],
                        'customerName': row[2],
                        'product': row[3],
                        'status': row[4],
                        'createdAt': row[5].isoformat() if row[5] else None,
                        'updatedAt': row[6].isoformat() if row[6] else None
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(orders)
                }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            customer_name = data.get('customerName')
            product = data.get('product')
            status = data.get('status', 'pending')
            tracking_number = data.get('trackingNumber')
            
            if not customer_name or not product or not tracking_number:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходимы поля: customerName, product, trackingNumber'})
                }
            
            cur.execute(
                "INSERT INTO orders (tracking_number, customer_name, product, status) VALUES (%s, %s, %s, %s) RETURNING id, tracking_number, customer_name, product, status, created_at, updated_at",
                (tracking_number, customer_name, product, status)
            )
            conn.commit()
            
            row = cur.fetchone()
            order = {
                'id': row[0],
                'trackingNumber': row[1],
                'customerName': row[2],
                'product': row[3],
                'status': row[4],
                'createdAt': row[5].isoformat() if row[5] else None,
                'updatedAt': row[6].isoformat() if row[6] else None
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(order)
            }
        
        elif method == 'PUT':
            data = json.loads(event.get('body', '{}'))
            order_id = data.get('id')
            new_status = data.get('status')
            
            if not order_id or not new_status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходимы поля: id, status'})
                }
            
            cur.execute(
                "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING id, tracking_number, customer_name, product, status, created_at, updated_at",
                (new_status, order_id)
            )
            conn.commit()
            
            row = cur.fetchone()
            if row:
                order = {
                    'id': row[0],
                    'trackingNumber': row[1],
                    'customerName': row[2],
                    'product': row[3],
                    'status': row[4],
                    'createdAt': row[5].isoformat() if row[5] else None,
                    'updatedAt': row[6].isoformat() if row[6] else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(order)
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заказ не найден'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()