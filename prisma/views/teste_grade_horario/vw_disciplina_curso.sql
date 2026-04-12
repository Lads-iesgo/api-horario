SELECT
  DISTINCT `d`.`idDisciplina` AS `idDisciplina`,
  `d`.`nomeDisciplina` AS `nomeDisciplina`,
  `d`.`codigoDisciplina` AS `codigoDisciplina`,
  `cd`.`periodo` AS `periodo`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      `teste_grade_horario`.`disciplina` `d`
      JOIN `teste_grade_horario`.`curso_disciplina` `cd` ON((`d`.`idDisciplina` = `cd`.`idDisciplina`))
    )
    JOIN `teste_grade_horario`.`curso` `c` ON((`cd`.`idCurso` = `c`.`idCurso`))
  )