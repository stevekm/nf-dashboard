Channel.from([ "Sample1", "Sample2", "Sample3", "Sample4", "Sample5", "Sample6", ]).set { samples }

process make_thing {
    echo true
    tag "${sampleID}"

    input:
    val(sampleID) from samples

    script:
    """
    echo "[make_thing] running ${sampleID}..."
    sleep 3
    """
}
