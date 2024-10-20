#!/bin/bash
.\act.exe -W .github/workflows/master.yml -P self-hosted=ghcr.io/catthehacker/ubuntu:act-latest --secret-file .secrets --var-file .variables