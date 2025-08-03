# 🧠 Local Meeting Transcriber

A cross-platform, privacy-first AI meeting assistant that transcribes, diarizes, and summarizes meetings using local models — deployable to the cloud, accessible from mobile.

---

## 🧪 Dev Roadmap

* [x] Project initialized
* [ ] Audio file upload endpoint
* [ ] WhisperX + diarization integration
* [ ] LLM-based meeting summarizer
* [ ] LangChain memory store
* [ ] Azure Terraform deployment
* [ ] App Store release

---

## 🚀 Features

- 🎙️ Record and upload meeting audio from mobile or web
- 🧠 Local transcription with WhisperX (high accuracy)
- 🗣️ Speaker diarization (who said what)
- ✍️ Summary generation with Ollama LLM
- 🔐 Secure user accounts with JWT auth
- 💾 Stores transcripts & notes tied to each user
- 📱 React Native frontend (iOS + Android)
- ☁️ .NET backend (ASP.NET Core Web API)
- 🔧 Azure + Terraform deployment ready

---

## 🧱 Project Structure

```bash
/local-meeting-transcriber
├── frontend/     # React Native mobile app (Expo)
├── backend/      # ASP.NET Core Web API
├── infra/        # Terraform scripts for Azure deploy
└── README.md
```

---

## 🛠️ Tech Stack

| Layer               | Tech                            |
| ------------------- | ------------------------------- |
| Frontend            | React Native (Expo)             |
| Backend API         | ASP.NET Core Web API (.NET 8)   |
| Auth                | ASP.NET Identity + JWT          |
| AI Transcription    | WhisperX (Python subprocess)    |
| Speaker Diarization | pyannote.audio                  |
| AI Summarization    | Ollama + LangChain              |
| Database            | MS SQL Server or MySQL/Postgres |
| Deployment          | Azure App Service + Terraform   |

---

## 🧑‍💻 Author

Built by [Affan Fareed (aka sosai)](https://github.com/ItMeansBigMountain) — software engineer, hacker, and martial artist ninja.

---