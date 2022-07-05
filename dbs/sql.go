package dbs

type NamedQuery struct {
	Name string `json:"name"`
	Sql  string `json:"sql"`
}

type SqlCommon struct {
	NamedQueries map[string]NamedQuery `json:"named_queries"`
	History      []string              `json:"history"`
}
