<template>
  <div class="chat-container">
    <div class="messages">
      <ul>
        <li v-for="message in messages" :key="message.id" :class="message.user">
          <!-- 添加判断，如果是机器人的消息也显示头像 -->
          <div class="avatar" :class="{ 'user-avatar': message.user === 'user', 'bot-avatar': message.user === 'bot' }"></div>
          <div class="message-content">
            <span class="sender-name" v-if="message.user === 'user'">你</span>
            <span class="sender-name" v-if="message.user === 'bot'">ChatGPT</span>
            <!-- 使用 v-html 来渲染 Markdown 文本 -->
            <div class="message-text" v-html="renderMarkdown(message.message)"></div>
          </div>
        </li>
      </ul>
    </div>
    <div class="input-container">
      <textarea v-model="userInput" @keydown="handleKeydown" placeholder="Type a message..."></textarea>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script src="../js/ChatBox.js"></script>
<style src="../css/ChatBox.css" scoped></style>