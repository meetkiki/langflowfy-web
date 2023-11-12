import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();

export default {
    data() {
        return {
            messages: [
                {user: 'bot', messageType: 'TEXT', message: '欢迎使用ChatGPT', html: '', time: '', done: true},
            ],
            generating: false,
            userInput: '',
            websocket: null
        };
    },
    created() {
        this.connectWebSocket();
    },
    methods: {
        getUuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            })
        },
        connectWebSocket() {
            const wsUrl = process.env.VUE_APP_WS_URL;
            console.log("wsUrl " + wsUrl)
            // 这里做一个简单的鉴权，只有符合条件的鉴权才能握手成功

            this.websocket = new WebSocket(wsUrl, ['token-123456']);

            this.websocket.onerror = (event) => {
                console.error('网络连接 错误:', event);
            };

            this.websocket.onclose = (event) => {
                console.log('网络连接 关闭:', event);
            };

            this.websocket.onmessage = (event) => {
                // 解析收到的消息
                const result = JSON.parse(event.data);

                console.log(result.content)

                // 检查消息是否完结
                if (result.done) {
                    this.messages[this.messages.length - 1].done = true;
                    return
                }

                if (this.messages[this.messages.length - 1].done) {
                    // 添加新的消息
                    this.messages.push({
                        time: Date.now(),
                        message: result.content,
                        messageType: 'TEXT',
                        user: 'bot',
                        done: false
                    });
                } else {
                    // 更新最后一条消息
                    let lastMessage = this.messages[this.messages.length - 1];
                    lastMessage.message += result.content;
                    this.messages[(this.messages.length - 1)] = lastMessage;
                }
            };
        },
        async sendMessage() {
            const chatId = this.getUuid();

            let message = this.userInput.trim();
            if (message && this.websocket) {
                // Markdown换行：在每个换行符之前添加两个空格
                message = message.replace(/(\r\n|\r|\n)/g, '  \n');

                this.messages.push({
                    time: Date.now(),
                    message: message,
                    messageType: 'TEXT',
                    user: 'user',
                    done: true
                })
                this.aiMessage = '';
                // 通过 WebSocket 发送消息
                this.websocket.send(JSON.stringify({ chatId: chatId, message: message }));
                this.userInput = '';
            }
        },
        renderMarkdown(rawMarkdown) {
            return md.render(rawMarkdown);
        },
        handleKeydown(event) {
            // Check if 'Enter' is pressed without the 'Alt' key
            if (event.key === 'Enter' && !(event.shiftKey || event.altKey)) {
                event.preventDefault(); // Prevent the default action to avoid line break in textarea
                this.sendMessage();
            } else if (event.key === 'Enter' && event.altKey) {
                // Allow 'Alt + Enter' to insert a newline
                const cursorPosition = event.target.selectionStart;
                const textBeforeCursor = this.userInput.slice(0, cursorPosition);
                const textAfterCursor = this.userInput.slice(cursorPosition);

                // Insert the newline character at the cursor position
                this.userInput = textBeforeCursor + '\n' + textAfterCursor;

                // Move the cursor to the right after the inserted newline
                this.$nextTick(() => {
                    event.target.selectionStart = cursorPosition + 1;
                    event.target.selectionEnd = cursorPosition + 1;
                });
            }
        },
        beforeDestroy() {
            if (this.websocket) {
                this.websocket.close();
            }
        },
    },
    updated() {
        const messagesContainer = this.$el.querySelector('.messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
};