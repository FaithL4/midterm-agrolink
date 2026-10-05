import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message, Attachment

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Get JWT token from query parameters
        query_string = self.scope.get('query_string', b'').decode()
        params = {}
        for pair in query_string.split('&'):
            if '=' in pair:
                key, val = pair.split('=', 1)
                params[key] = val
        token = params.get('token')

        # Authenticate user
        self.user = await self.get_user_from_jwt(token)
        if self.user is None or not await self.is_member_of_conversation(self.user, self.conversation_id):
            # Reject connection if not authenticated or not a member of this chat
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message', '').strip()
        message_type = data.get('message_type', 'text')
        attachment_url = data.get('attachment_url', '')

        if not message_content and not attachment_url:
            return

        # Save to database
        saved_msg = await self.save_message(self.user, self.conversation_id, message_content, message_type, attachment_url)

        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': saved_msg.id,
                'sender_id': self.user.id if self.user else None,
                'sender_username': self.user.username if self.user else 'System',
                'sender_role': self.user.role if self.user else 'system',
                'text': saved_msg.message,
                'message_type': saved_msg.message_type,
                'attachment_url': attachment_url,
                'time': saved_msg.created_at.strftime('%I:%M %p')
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user_from_jwt(self, token_str):
        if not token_str:
            return None
        try:
            access_token = AccessToken(token_str)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None

    @database_sync_to_async
    def is_member_of_conversation(self, user, conversation_id):
        try:
            conv = ChatRoom.objects.get(id=conversation_id)
            return user == conv.buyer or user == conv.farmer or user == conv.transporter
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, sender, conversation_id, content, message_type, attachment_url):
        conv = ChatRoom.objects.get(id=conversation_id)
        msg = Message.objects.create(
            chat_room=conv,
            sender=sender,
            message=content,
            message_type=message_type
        )
        if attachment_url:
            Attachment.objects.create(
                message=msg,
                file_url=attachment_url,
                file_type='image' if message_type == 'image' else 'file'
            )
        return msg


class GlobalUpdatesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope.get('query_string', b'').decode()
        params = {}
        for pair in query_string.split('&'):
            if '=' in pair:
                key, val = pair.split('=', 1)
                params[key] = val
        token = params.get('token')

        self.user = await self.get_user_from_jwt(token)
        self.groups_joined = ['global_updates']
        await self.channel_layer.group_add('global_updates', self.channel_name)

        if self.user:
            user_group = f'user_{self.user.id}'
            self.groups_joined.append(user_group)
            await self.channel_layer.group_add(user_group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        for group in self.groups_joined:
            await self.channel_layer.group_discard(group, self.channel_name)

    async def send_update(self, event):
        await self.send(text_data=json.dumps({
            'event_type': event.get('event_type'),
            'data': event.get('data')
        }))

    @database_sync_to_async
    def get_user_from_jwt(self, token_str):
        if not token_str:
            return None
        try:
            access_token = AccessToken(token_str)
            user_id = access_token['user_id']
            return User.objects.get(id=user_id)
        except Exception:
            return None
