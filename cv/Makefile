# Build the CV PDFs in place (same folder as the sources).
#   make        # build both
#   make en     # English only
#   make zh     # Chinese only
#   make clean  # remove build artifacts
LATEXMK      ?= latexmk
LATEXMKFLAGS  = -xelatex -interaction=nonstopmode -halt-on-error -file-line-error

EN_JOB = Jialiang-Li-CV-EN
ZH_JOB = Jialiang-Li-CV-CN

.PHONY: all en zh clean

all: en zh

en:
	cd en && $(LATEXMK) $(LATEXMKFLAGS) -jobname=$(EN_JOB) resume.tex

zh:
	cd zh && $(LATEXMK) $(LATEXMKFLAGS) -jobname=$(ZH_JOB) resume.tex

clean:
	cd en && rm -f resume.aux resume.log resume.out resume.fls resume.fdb_latexmk \
		$(EN_JOB).aux $(EN_JOB).log $(EN_JOB).out $(EN_JOB).fls \
		$(EN_JOB).fdb_latexmk $(EN_JOB).synctex.gz
	cd zh && rm -f resume.aux resume.log resume.out resume.fls resume.fdb_latexmk \
		$(ZH_JOB).aux $(ZH_JOB).log $(ZH_JOB).out $(ZH_JOB).fls \
		$(ZH_JOB).fdb_latexmk $(ZH_JOB).synctex.gz
