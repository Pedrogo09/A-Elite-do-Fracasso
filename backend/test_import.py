import sys
try:
    import main
    print("OK - Backend importado sem erros!")
except Exception as e:
    print(f"ERRO: {e}")
    sys.exit(1)
