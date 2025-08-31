import os, sys, json, argparse, torch, tempfile
import whisperx

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", required=True, help="path to audio file (wav/mp3/m4a)")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    ap.add_argument("--hf_token", default=os.getenv("HF_TOKEN",""))
    args = ap.parse_args()

    model = whisperx.load_model("base", device=args.device)
    result = model.transcribe(args.audio)

    # alignment (improves timestamps)
    align_model, metadata = whisperx.load_align_model(language_code=args.lang, device=args.device)
    aligned = whisperx.align(result["segments"], align_model, metadata, args.audio, device=args.device)

    # diarization (speaker labels)
    diarize_pipe = whisperx.DiarizationPipeline(use_auth_token=args.hf_token, device=args.device) if args.hf_token else None
    diarized_segments = []
    if diarize_pipe:
        diar = diarize_pipe(args.audio)
        diarized_segments = diar["segments"]

    merged = whisperx.merge(aligned["segments"], diarized_segments) if diarize_pipe else aligned["segments"]

    # build friendly output
    transcript = " ".join(seg.get("text","").strip() for seg in aligned["segments"]).strip()
    diar_lines = []
    for seg in merged:
        spk = seg.get("speaker", "Speaker?")
        txt = seg.get("text","").strip()
        if txt:
            diar_lines.append(f"[{spk}] {txt}")
    diarized_text = "\n".join(diar_lines)

    print(json.dumps({
        "transcript": transcript,
        "diarized": diarized_text
    }, ensure_ascii=False))
if __name__ == "__main__":
    main()
