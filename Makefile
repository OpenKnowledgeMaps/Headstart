make:
	@echo " ✅ Encoding input.json..."
	@node ./examples/tome.gg/docs/encode-string.js ./examples/tome.gg/docs/input.json
	@echo " ✅ Updating Tome.gg data..."
	@cp ./examples/tome.gg/docs/input.json.output.json ./examples/tome.gg/data/tomegg.json
	@echo " ✅ Clean up..."
	@rm ./examples/tome.gg/docs/input.json.output.json
	@echo " ✅ Done!"