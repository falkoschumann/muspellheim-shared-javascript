# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
# TODO remove --experimental-vm-modules when Jest supports ESM
export NODE_OPTIONS=--experimental-global-customevent --experimental-vm-modules
export NPM_CONFIG_YES=true

all: dist check docs

clean:
	rm -rf coverage
	rm -rf docs

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build

docs:
	npx jsdoc lib --recurse --configure jsdoc.conf.json --destination docs --package package.json --readme README.md

check: test
	npx prettier . --check
	npx eslint lib test

format:
	npx prettier . --write
	npx eslint --fix lib test

test: prepare
	npm test

unit-tests: prepare
	npx jest --testPathPattern=".*\/unit\/.*"

integration-tests:
	npx jest --testPathPattern=".*\/integration\/.*"

e2e-tests: prepare
	npx jest --testPathPattern=".*\/e2e\/.*"

watch: prepare
	npx jest --watch

coverage: prepare
	npx jest --coverage

build: prepare
	npm run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi

version:
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

.PHONY: all clean distclean dist docs check format \
	test unit-tests integration-tests e2e-tests watch coverage \
	build prepare version
